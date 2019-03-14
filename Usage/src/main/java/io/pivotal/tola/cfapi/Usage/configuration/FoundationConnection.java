package io.pivotal.tola.cfapi.Usage.configuration;

import org.cloudfoundry.operations.DefaultCloudFoundryOperations;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.client.ReactorCloudFoundryClient;
import org.cloudfoundry.reactor.doppler.ReactorDopplerClient;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.reactor.uaa.ReactorUaaClient;

import reactor.core.publisher.Mono;

/**
 * FoundationConnection - manages the cf java api to connect to a foundation
 */
public class FoundationConnection {

    private ConnectionContext connectionContext;
    private PasswordGrantTokenProvider tokenProvider;

    public FoundationConnection(ConnectionContext connectionContext, PasswordGrantTokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
        this.connectionContext = connectionContext;
    } 

    public String getToken() {
        Mono<String> token = tokenProvider.getToken(connectionContext);
        return token.block();
    }

    public DefaultCloudFoundryOperations getCloudFoundryOperations() {
        return DefaultCloudFoundryOperations.builder()
                .cloudFoundryClient(cloudFoundryClient())
                .dopplerClient(dopplerClient())
                .uaaClient(uaaClient())
                .organization("")
                .space("")
                .build();
    }


    ///////////////////////////////////////

    private ReactorCloudFoundryClient cloudFoundryClient() {
        return ReactorCloudFoundryClient.builder() 
            .connectionContext(connectionContext)
            .tokenProvider(tokenProvider)
            .build();
    }
    
    private ReactorDopplerClient dopplerClient() {
        return ReactorDopplerClient.builder()
            .connectionContext(connectionContext)
            .tokenProvider(tokenProvider)
            .build();
    }
    
    private ReactorUaaClient uaaClient() {
        return ReactorUaaClient.builder()
            .connectionContext(connectionContext)
            .tokenProvider(tokenProvider)
            .build();
    }    

}