package io.pivotal.tola.cfapi.usage;

import io.pivotal.tola.cfapi.usage.configuration.SSLValidationDisabler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class UsageApplication {

	private static final Logger LOG = LoggerFactory.getLogger(UsageApplication.class);

	public static void main(String[] args) {
		SSLValidationDisabler.disableSSLValidation();
		SpringApplication.run(UsageApplication.class, args);
	}	

}
