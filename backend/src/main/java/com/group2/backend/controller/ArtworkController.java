package com.group2.backend.controller;

import com.group2.backend.dto.ArtworkCreateDto;
import com.group2.backend.dto.ArtworkDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import com.group2.backend.dto.ArtworkUpdateDto;
import com.group2.backend.dto.LikeCountDto;
import com.group2.backend.service.ArtworkLikeService;
import com.group2.backend.service.ArtworkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/artworks")
@RequiredArgsConstructor
@Tag(name = "artworks", description = "Artwork management endpoints")
public class ArtworkController {

    private final ArtworkService artworkService;
    private final ArtworkLikeService artworkLikeService;

    @GetMapping
    @Operation(summary = "List artworks", description = "Paginated artworks")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK")
    })
    public ResponseEntity<Page<ArtworkSummaryDto>> list(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String sort
    ) {
        return ResponseEntity.ok(artworkService.listArtworks(page, size, sort));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get artwork", description = "Get artwork by id and increment views")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<ArtworkDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(artworkService.getArtwork(id));
    }

    @PostMapping
    @Operation(summary = "Create artwork", description = "Create a new artwork", security = @SecurityRequirement(name = "bearer-jwt"))
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Created"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    public ResponseEntity<ArtworkDto> create(@RequestBody ArtworkCreateDto body) {
        ArtworkDto created = artworkService.createArtwork(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update artwork", description = "Update existing artwork", security = @SecurityRequirement(name = "bearer-jwt"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<ArtworkDto> update(@PathVariable Long id, @RequestBody ArtworkUpdateDto body) {
        return ResponseEntity.ok(artworkService.updateArtwork(id, body));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete artwork", description = "Delete existing artwork", security = @SecurityRequirement(name = "bearer-jwt"))
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Deleted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "403", description = "Forbidden"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        artworkService.deleteArtwork(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search artworks", description = "Search artworks by title")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK")
    })
    public ResponseEntity<List<ArtworkSummaryDto>> search(@RequestParam String query) {
        return ResponseEntity.ok(artworkService.search(query));
    }

    @GetMapping("/trending")
    @Operation(summary = "Trending artworks", description = "List trending artworks by views")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK")
    })
    public ResponseEntity<List<ArtworkSummaryDto>> trending() {
        return ResponseEntity.ok(artworkService.trending());
    }

    @PostMapping("/{id}/like")
    @Operation(summary = "Like artwork", description = "Like an artwork", security = @SecurityRequirement(name = "bearer-jwt"))
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<Void> like(@PathVariable Long id) {
        artworkLikeService.like(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    @Operation(summary = "Unlike artwork", description = "Remove like from artwork", security = @SecurityRequirement(name = "bearer-jwt"))
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Deleted"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<Void> unlike(@PathVariable Long id) {
        artworkLikeService.unlike(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/likes")
    @Operation(summary = "Artwork likes", description = "Get like count for artwork")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "OK"),
        @ApiResponse(responseCode = "404", description = "Not found")
    })
    public ResponseEntity<LikeCountDto> likeCount(@PathVariable Long id) {
        long count = artworkLikeService.count(id);
        return ResponseEntity.ok(LikeCountDto.builder().count(count).build());
    }
}
