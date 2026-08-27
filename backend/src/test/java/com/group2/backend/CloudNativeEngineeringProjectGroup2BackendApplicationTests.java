package com.group2.backend;

import com.group2.backend.service.BlobStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
	"spring.mongodb.uri=mongodb://127.0.0.1:27017/cne-test",
	"spring.data.mongodb.auto-index-creation=false"
})
@ActiveProfiles("test")
class CloudNativeEngineeringProjectGroup2BackendApplicationTests {

	@MockitoBean
	private BlobStorageService blobStorageService;

	@Test
	void contextLoads() {
	}

}
