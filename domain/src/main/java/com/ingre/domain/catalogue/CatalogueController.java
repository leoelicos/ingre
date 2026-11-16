package com.ingre.domain.catalogue;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only catalogue endpoints for the BFF and for verifying the seed. */
@RestController
@RequiredArgsConstructor
public class CatalogueController {

  private final JdbcTemplate jdbc;

  @GetMapping("/catalogue/ingredients")
  public List<Map<String, Object>> ingredients() {
    return jdbc.queryForList(
        "select id, name, category, pantry from catalogue_ingredients order by name");
  }

  @GetMapping("/catalogue/recipes")
  public List<Map<String, Object>> recipes() {
    return jdbc.queryForList(
        """
        select r.id, r.name, r.portions,
               (select count(*) from catalogue_recipe_ingredients ri where ri.recipe_id = r.id) as ingredients,
               (select count(*) from catalogue_recipe_steps s where s.recipe_id = r.id) as steps
        from catalogue_recipes r
        order by r.name
        """);
  }
}
