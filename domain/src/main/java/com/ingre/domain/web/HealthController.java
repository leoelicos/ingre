package com.ingre.domain.web;

import lombok.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

  @GetMapping("/health")
  public Status health() {
    return new Status("ok");
  }

  @Value
  static class Status {
    String status;
  }
}
