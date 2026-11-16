package com.ingre.domain.config;

import java.net.URI;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Accepts Render's DATABASE_URL (postgres://user:pass@host:port/db) as well as a
 * plain JDBC URL. Spring's default does not parse the postgres:// form.
 */
@Configuration
public class DatabaseConfig {

  @Bean
  @Primary
  @ConditionalOnProperty(name = "DATABASE_URL")
  public HikariDataSource dataSource(Environment env) {
    String raw = env.getProperty("DATABASE_URL", "");
    HikariDataSource ds = new HikariDataSource();
    if (raw.startsWith("postgres://") || raw.startsWith("postgresql://")) {
      URI uri = URI.create(raw);
      String[] userInfo = uri.getUserInfo() == null ? new String[0] : uri.getUserInfo().split(":", 2);
      ds.setJdbcUrl(
          "jdbc:postgresql://"
              + uri.getHost()
              + ":"
              + (uri.getPort() == -1 ? 5432 : uri.getPort())
              + uri.getPath());
      if (userInfo.length > 0) ds.setUsername(userInfo[0]);
      if (userInfo.length > 1) ds.setPassword(userInfo[1]);
    } else {
      ds.setJdbcUrl(raw);
      ds.setUsername(env.getProperty("DATABASE_USERNAME", "postgres"));
      ds.setPassword(env.getProperty("DATABASE_PASSWORD", "postgres"));
    }
    return ds;
  }
}
