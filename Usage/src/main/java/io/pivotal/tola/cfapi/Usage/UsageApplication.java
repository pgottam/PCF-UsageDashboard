package io.pivotal.tola.cfapi.Usage;

import java.util.Calendar;

import org.cloudfoundry.operations.CloudFoundryOperations;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.DefaultConnectionContext;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.uaa.UaaClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import reactor.core.publisher.Mono;

@SpringBootApplication
@CrossOrigin(origins = "*")
@RestController
public class UsageApplication {
	
	public static String oauthToken = new String();
	
	public String prod1ApiHost;
	public String prod2ApiHost;
	public String stageApiHost;
	public String devApiHost;
	
	public String prod1SysDomain;
	public String prod2SysDomain;
	public String stageSysDomain;
	public String devSysDomain;
			
	private static final Logger LOG = LoggerFactory.getLogger(UsageApplication.class);

	public static void main(String[] args) {
		//if ("true".equals(System.getenv("SKIP_SSL_VALIDATION"))) {
            SSLValidationDisabler.disableSSLValidation();
        //}

		SpringApplication.run(UsageApplication.class, args);
	}

	@Component
	class GetToken implements ApplicationRunner {

		private ConnectionContext connectionContext;

		private PasswordGrantTokenProvider tokenProvider;

		@Autowired
		public GetToken(PasswordGrantTokenProvider tokenProvider, ConnectionContext connectionContext) {
			this.tokenProvider = tokenProvider;
			this.connectionContext = connectionContext;
		}

		@Override
		public void run(ApplicationArguments args) throws Exception {
			

			// Sets oauth token for API calls...move down to each requestMapping to be invoked accordinly, based on which foundation data is needed.
			Mono<String> token = tokenProvider.getToken(connectionContext);
			//assign oauth token to global variable to be used in various usage API calls
			oauthToken = token.block();
			LOG.info("Token is {}", token.block());
		}
	}
	
	// Pulls in values for the API end point of each foundation
	@Autowired
	public void GetApiHost(@Value("${cf.pdcApiHost}") String prod1ApiHost, 
			@Value("${cf.cdcApiHost}") String prod2ApiHost,
			@Value("${cf.stageApiHost}") String stageApiHost,
			@Value("${cf.devApiHost}") String devApiHost) {
		
		this.prod1ApiHost = prod1ApiHost;
		this.prod2ApiHost = prod2ApiHost;
		this.stageApiHost = stageApiHost;
		this.devApiHost = devApiHost;
		
	}
	
	// Pulls in values for each system domain for each foundation
	@Autowired
	public void GetSysDomain(@Value("${cf.pdcSysDomain}") String prod1SysDomain, 
			@Value("${cf.cdcSysDomain}") String prod2SysDomain,
			@Value("${cf.stageSysDomain}") String stageSysDomain, 
			@Value("${cf.devSysDomain}") String devSysDomain) {
		
		this.prod1SysDomain = prod1SysDomain;
		this.prod2SysDomain = prod2SysDomain;
		this.stageSysDomain = stageSysDomain;
		this.devSysDomain = devSysDomain;
		
		System.out.println("Sys Domains= " + prod1SysDomain + " " + prod2SysDomain + " " + stageSysDomain + " " + devSysDomain);
		
	}
	
	//Eventually DELETE this
	@GetMapping("/api/getToken")
    public ResponseEntity<String> getToken() throws InterruptedException {
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("TEST", "Test Header");
              		
		String responseBody = oauthToken;
        HttpStatus responseStatus = HttpStatus.OK;

        return new ResponseEntity<String>(responseBody, responseHeaders, responseStatus);
    }
	
	
	// Pulls AI usage data for a specific Foundation	
	@RequestMapping(value = "/api/foundationAppUsage", params = "foundationName")
	@ResponseBody
	public ResponseEntity<String> foundationAppUsage(
			@RequestParam("foundationName") String foundationName) {
		
		//set current year for usage API call
		//int year = Calendar.getInstance().get(Calendar.YEAR);
		String apiHost = "";
		String uri = "";
		//String sysDomain = "";
		
		String fName = foundationName;
		//Determine which foundation API to call based on the foundation name passed with the request
		switch(fName) {
			case "PDC":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + prod1SysDomain + "/system_report/app_usages";
				// Sets API host for the foundation
				apiHost = prod1ApiHost;
				break;
			case "CDC":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + prod2SysDomain + "/system_report/app_usages";
				// Sets API host for the foundation
				apiHost = prod2ApiHost;
				break;
			case "Stage":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + stageSysDomain + "/system_report/app_usages";
				// Sets API host for the foundation
				apiHost = stageApiHost;
				break;
			case "Dev":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + devSysDomain + "/system_report/app_usages";
				// Sets API host for the foundation
				apiHost = devApiHost;
				break;		
				
		}
		
		// Builds the connectionContext for the specific foundation
		DefaultConnectionContext connectContext = DefaultConnectionContext.builder()
			.apiHost(apiHost)
			.skipSslValidation(true)
			.build();
		//System.out.println("URI: " + uri + " and API Host " + apiHost);
		
		/*PasswordGrantTokenProvider tokenProvider = PasswordGrantTokenProvider.builder()
				.password(password)
				.username(username)
				.build();
		*/		
		//final String uri="https://"+ apiHost + "/v2/apps";
		//final String uri = "https://app-usage."+ prod1SysDomain +"/organizations/"+ orgGuid +"/app_usages?start="+ year +"-01-01&end="+ year +"-03-31";
		//LOG.info("AppUsage URI: " + uri);
		
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", oauthToken);
		headers.set("Foudation", fName);
		
		RestTemplate restTemplate = new RestTemplate();
		
	    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
	    
	    // Set the response header with the foundation name to be sent back to the Angular front end for parsing multiple foundations' data for proper HTML display
  		HttpHeaders responseHeaders = new HttpHeaders();
  		responseHeaders.set("Foundation", foundationName);
  		//System.out.println("Foundation Name: " + foundationName);
	     
	    ResponseEntity<String> appInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class, responseHeaders);
	    
	    //String aTemp = appInfo.ok().headers(responseHeaders);
		
	    
		return appInfo;
	}
	
	// Pulls SI usage data for a specific Foundation
	@RequestMapping(value = "/api/foundationSvcUsage", params = "foundationName")
	@ResponseBody
	public ResponseEntity<String> foundationSvcUsage(
			@RequestParam("foundationName") String foundationName) {
			
		//set current year for usage API call
		//int year = Calendar.getInstance().get(Calendar.YEAR);
		String apiHost = "";
		String uri = "";
		//String sysDomain = "";
		
		String fName = foundationName;
		//Determine which foundation API to call based on the foundation name passed with the request
		switch(fName) {
			case "PDC":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + prod1SysDomain + "/system_report/service_usages";
				// Sets API host for the foundation
				apiHost = prod1ApiHost;
				break;
			case "CDC":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + prod2SysDomain + "/system_report/service_usages";
				// Sets API host for the foundation
				apiHost = prod2ApiHost;
				break;
			case "Stage":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + stageSysDomain + "/system_report/service_usages";
				// Sets API host for the foundation
				apiHost = stageApiHost;
				break;
			case "Dev":
				// Sets the API URL for the specific foundation
				uri = "https://app-usage." + devSysDomain + "/system_report/service_usages";
				// Sets API host for the foundation
				apiHost = devApiHost;
				break;		
				
		}
		
		// Builds the connection for the specific foundation
		DefaultConnectionContext connectContext = DefaultConnectionContext.builder()
			.apiHost(apiHost)
			.skipSslValidation(true)
			.build();
		//System.out.println("URI: " + uri + " and API Host " + apiHost);
		
		/*PasswordGrantTokenProvider tokenProvider = PasswordGrantTokenProvider.builder()
				.password(password)
				.username(username)
				.build();
		*/		
		//final String uri="https://"+ apiHost + "/v2/apps";
		//final String uri = "https://app-usage."+ prod1SysDomain +"/organizations/"+ orgGuid +"/app_usages?start="+ year +"-01-01&end="+ year +"-03-31";
		//LOG.info("AppUsage URI: " + uri);
		
		// Sets request header with the cf oauth token value
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", oauthToken);
		
		RestTemplate restTemplate = new RestTemplate();
		
	    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
	    
	    ResponseEntity<String> svcInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
 		//System.out.println("Result: " + appInfo);
		
 		return svcInfo;
	}
	
	// Pulls User usage data for a specific Foundation
		@RequestMapping(value = "/api/getUsers", params = "foundationName")
		@ResponseBody
		public ResponseEntity<String> getUsers(
				@RequestParam("foundationName") String foundationName) {
				
			//set current year for usage API call
			//int year = Calendar.getInstance().get(Calendar.YEAR);
			String apiHost = "";
			String uri = "";
			//String sysDomain = "";
			
			String fName = foundationName;
			// Determine which foundation API to call based on the foundation name passed with the request
			switch(fName) {
				case "PDC":	
					// Sets API host for the foundation
					apiHost = prod1ApiHost;
					break;
				case "CDC":
					// Sets API host for the foundation
					apiHost = prod2ApiHost;
					break;
				case "Stage":
					// Sets API host for the foundation
					apiHost = stageApiHost;
					break;
				case "Dev":
					// Sets API host for the foundation
					apiHost = devApiHost;
					break;		
					
			}
			// Sets the API URL to pull back user information
			uri = "https://" + apiHost + "/v2/users";
			
			// Builds the connection for the specific foundation
			DefaultConnectionContext connectContext = DefaultConnectionContext.builder()
				.apiHost(apiHost)
				.skipSslValidation(true)
				.build();
			//System.out.println("URI: " + uri + " and API Host " + apiHost);
			
			/*PasswordGrantTokenProvider tokenProvider = PasswordGrantTokenProvider.builder()
					.password(password)
					.username(username)
					.build();
			*/		
			//final String uri="https://"+ apiHost + "/v2/apps";
			//final String uri = "https://app-usage."+ prod1SysDomain +"/organizations/"+ orgGuid +"/app_usages?start="+ year +"-01-01&end="+ year +"-03-31";
			//LOG.info("AppUsage URI: " + uri);
			
			// Sets request header with the cf oauth token value
			HttpHeaders headers = new HttpHeaders();
			headers.set("Authorization", oauthToken);
			
			RestTemplate restTemplate = new RestTemplate();
			
		    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
		    
		    ResponseEntity<String> userInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
	 		// System.out.println("Result: " + appInfo);
			
	 		return userInfo;
		}
	
	// Pulls App usage data for a specific Organization
	@RequestMapping(value = "/api/appUsage",
			params = { "foundationName", "orgGuid", "quarter" })
	@ResponseBody
	public ResponseEntity<String> appUsage(
			@RequestParam(value = "foundationName") String foundationName,
			@RequestParam(value = "orgGuid") String orgGuid, 
			@RequestParam(value = "quarter") String quarter) {
		
		System.out.println("Params: " + foundationName + " ," + orgGuid + " ," + quarter);
		
		// set current year for usage API call
		int year = Calendar.getInstance().get(Calendar.YEAR);
		
		String fName = foundationName;
		String orgId = orgGuid;
		String qtr = quarter;
		
		String sysDomain = "";
		String startDate = "";
		String endDate = "";
		
		// Determine start and end dates for API to call based on which quarter is requested
		switch(qtr) {
			case "Q1":	
				
				startDate = "01-01";
				endDate = "03-31";
				break;
			case "Q2":
				startDate = "04-01";
				endDate = "06-30";
				break;
			case "Q3":
				startDate = "07-01";
				endDate = "09-30";
				break;
			case "Q4":
				startDate = "10-01";
				endDate = "12-31";
				break;		
				
		}
		
		// Determine which system domain to call based on the foundation name passed with the request
		switch(fName) {
			case "PDC":	
				sysDomain = prod1SysDomain;
				break;
			case "CDC":
				sysDomain = prod2SysDomain;
				break;
			case "Stage":
				sysDomain = stageSysDomain;
				break;
			case "Dev":
				sysDomain = devSysDomain;
				break;		
				
		}
		
		//String orgId = "5fc0a009-f288-40fb-8c0d-55eb682bd926";
		final String uri = "https://app-usage."+ sysDomain +"/organizations/"+ orgId +"/app_usages?start="+ year +"-" + startDate + "&end="+ year +"-" + endDate;
		System.out.println("URI: " + uri);
		//LOG.info("AppUsage URI: " + uri);
		
		// Sets Authorization token as header needed for CF API calls
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", oauthToken);
		
		RestTemplate restTemplate = new RestTemplate();
		
	    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
	     
	    ResponseEntity<String> appInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
		
		//System.out.println("Result: " + result);
		
		return appInfo;
	}
	
	// Pulls service usage for a specific organization
	@RequestMapping(value = "/api/svcUsage", params = "orgGuid")
	public ResponseEntity<String> svcUsage(
			@RequestParam("orgGuid") String orgGuid) {
		
		//set current year for usage API call
		int year = Calendar.getInstance().get(Calendar.YEAR);
		
		String orgId = orgGuid;
		//String spaceId = "58ac11b4-74e0-486e-9743-3579ea618148";
		
		//final String uri="https://"+ apiHost + "/v2/apps";
		final String uri = "https://app-usage."+ prod1SysDomain +"/organizations/"+ orgId +"/service_usages?start="+ year +"-01-01&end="+ year +"-03-31";
		LOG.info("SvcUsage URI: " + uri);
		
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", oauthToken);
		
		RestTemplate restTemplate = new RestTemplate();
		
	    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
	     
	    ResponseEntity<String> svcInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
		
		//System.out.println("Result: " + result);
		
		return svcInfo;
	}
	
	@RequestMapping(
			value = "/api/getOrgs")
	public ResponseEntity<String> getOrgs() {
		
		final String uri="https://"+ prod1ApiHost + "/v2/organizations";
		
		
		HttpHeaders headers = new HttpHeaders();
		headers.set("Authorization", oauthToken);
		
		RestTemplate restTemplate = new RestTemplate();
		
	    HttpEntity<String> entity = new HttpEntity<String>("parameters", headers);
	     
	    ResponseEntity<String> appInfo = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
		
		//System.out.println("Result: " + result);
		
		return appInfo;
	}

	///////////////////////////////////////////////////////
	// CF Java API Bean definitions
	///////////////////////////////////////////////////////
	
	// UPDATE: Modify code to login into each foundation prior to making API calls

	@Bean
	DefaultConnectionContext connectionContext(@Value("${cf.pdcApiHost}") String apiHost) {
		return DefaultConnectionContext.builder()
				.apiHost(apiHost)
				.skipSslValidation(true)
				.build();
	}

	@Bean
	PasswordGrantTokenProvider tokenProvider(@Value("${cf.username}") String username,
			@Value("${cf.password}") String password) {
		return PasswordGrantTokenProvider.builder()
				.password(password)
				.username(username)
				.build();
	}

}
