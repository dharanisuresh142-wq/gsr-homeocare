package com.gsr.homeocare;

import com.gsr.homeocare.config.MongoProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(MongoProperties.class)
public class GsrHomeocareApplication {

    public static void main(String[] args) {
        SpringApplication.run(GsrHomeocareApplication.class, args);
    }
}
