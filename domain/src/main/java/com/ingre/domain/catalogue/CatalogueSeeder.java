package com.ingre.domain.catalogue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Loads the bundled catalogue JSON into Postgres when the tables are empty. */
@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogueSeeder implements CommandLineRunner {

  private final JdbcTemplate jdbc;
  private final ObjectMapper json = new ObjectMapper();

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    Integer count = jdbc.queryForObject("select count(*) from catalogue_recipes", Integer.class);
    if (count != null && count > 0) {
      log.info("Catalogue already seeded ({} recipes)", count);
      return;
    }
    seedIngredients();
    seedRecipes();
    Integer recipes = jdbc.queryForObject("select count(*) from catalogue_recipes", Integer.class);
    Integer ingredients =
        jdbc.queryForObject("select count(*) from catalogue_ingredients", Integer.class);
    log.info("Seeded catalogue: {} ingredients, {} recipes", ingredients, recipes);
  }

  private void seedIngredients() throws IOException {
    JsonNode root = read("catalogue/ingredients.json");
    for (JsonNode node : root.path("ingredients")) {
      jdbc.update(
          """
          insert into catalogue_ingredients (id, name, category, pantry, allergens, sold)
          values (?, ?, ?, ?, ?, ?::jsonb)
          """,
          text(node, "id"),
          text(node, "name"),
          text(node, "category"),
          text(node, "pantry"),
          allergens(node.path("allergens")),
          node.path("sold").toString());
    }
  }

  private void seedRecipes() throws IOException {
    JsonNode root = read("catalogue/recipes.json");
    for (JsonNode node : root.path("recipes")) {
      String id = text(node, "id");
      jdbc.update(
          "insert into catalogue_recipes (id, name, portions) values (?, ?, ?)",
          id,
          text(node, "name"),
          node.path("portions").asDouble(1));
      int position = 0;
      for (JsonNode line : node.path("ingredients")) {
        jdbc.update(
            """
            insert into catalogue_recipe_ingredients
              (recipe_id, position, ingredient_id, quantity, measure)
            values (?, ?, ?, ?, ?)
            """,
            id,
            position++,
            text(line, "ingredientId"),
            line.path("quantity").asDouble(0),
            text(line, "measure"));
      }
      position = 0;
      for (JsonNode step : node.path("method")) {
        jdbc.update(
            "insert into catalogue_recipe_steps (recipe_id, position, text) values (?, ?, ?)",
            id,
            position++,
            step.asText());
      }
    }
  }

  private JsonNode read(String path) throws IOException {
    try (InputStream in = new ClassPathResource(path).getInputStream()) {
      return json.readTree(in);
    }
  }

  private static String text(JsonNode node, String field) {
    JsonNode value = node.path(field);
    return value.isMissingNode() || value.isNull() ? null : value.asText();
  }

  private static String[] allergens(JsonNode node) {
    List<String> values = new ArrayList<>();
    if (node.isArray()) {
      node.forEach(item -> values.add(item.asText()));
    }
    return values.toArray(String[]::new);
  }
}
