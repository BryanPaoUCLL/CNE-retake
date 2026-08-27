package com.group2.backend;

import com.group2.backend.service.BlobStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
	"spring.mongodb.uri=mongodb://127.0.0.1:27017/cne-test",
	"spring.data.mongodb.auto-index-creation=false"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class CloudNativeEngineeringProjectGroup2BackendApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@MockitoBean
	private BlobStorageService blobStorageService;

	@Test
	void contextLoads() {
	}

	@Test
	void livenessEndpointIsPublic() throws Exception {
		mockMvc.perform(get("/actuator/health/liveness"))
			.andExpect(status().isOk())
			.andExpect(jsonPath("$.status").value("UP"));
	}

}
