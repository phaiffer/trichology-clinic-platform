package com.phaiffer.clinic.modules.report.infrastructure.storage;

import com.phaiffer.clinic.shared.config.report.ReportStorageProperties;
import com.phaiffer.clinic.shared.exception.ResourceNotFoundException;
import com.phaiffer.clinic.shared.exception.report.ReportStorageException;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class LocalReportFileStorage implements ReportFileStorage {

    private static final Pattern UNSAFE_FILE_NAME_CHARS = Pattern.compile("[^a-zA-Z0-9._-]");

    private final Path rootDirectory;

    public LocalReportFileStorage(ReportStorageProperties properties) {
        this.rootDirectory = Path.of(properties.getStorageRoot()).toAbsolutePath().normalize();
    }

    @Override
    public StoredReportFile store(UUID patientId, String requestedFileName, byte[] content) {
        String safeBaseFileName = sanitizeFileName(requestedFileName);
        if (!safeBaseFileName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            safeBaseFileName = safeBaseFileName + ".pdf";
        }

        LocalDate today = LocalDate.now();
        Path relativeDirectory = Path.of(
                patientId.toString(),
                String.valueOf(today.getYear()),
                String.format("%02d", today.getMonthValue())
        );
        String fileName = UUID.randomUUID() + "-" + safeBaseFileName;
        Path targetPath = resolveStoragePath(relativeDirectory.resolve(fileName).toString());

        try {
            Files.createDirectories(targetPath.getParent());
            Files.write(targetPath, content);
            return new StoredReportFile(fileName, rootDirectory.relativize(targetPath).toString().replace('\\', '/'));
        } catch (IOException exception) {
            throw new ReportStorageException("Unable to store generated report", exception);
        }
    }

    @Override
    public Resource loadAsResource(String storagePath) {
        Path resolvedPath = resolveStoragePath(storagePath);
        if (!Files.exists(resolvedPath) || !Files.isRegularFile(resolvedPath)) {
            throw new ResourceNotFoundException("Stored report file not found");
        }

        return new FileSystemResource(resolvedPath);
    }

    @Override
    public void delete(String storagePath) {
        Path resolvedPath = resolveStoragePath(storagePath);

        try {
            Files.deleteIfExists(resolvedPath);
        } catch (IOException exception) {
            throw new ReportStorageException("Unable to delete generated report file", exception);
        }
    }

    private Path resolveStoragePath(String storagePath) {
        Path resolvedPath = rootDirectory.resolve(storagePath).normalize();
        if (!resolvedPath.startsWith(rootDirectory)) {
            throw new ReportStorageException("Invalid report storage path");
        }

        return resolvedPath;
    }

    private String sanitizeFileName(String fileName) {
        String normalized = fileName == null ? "clinical-report.pdf" : fileName.strip();
        normalized = normalized.replace("\\", "/");
        int lastSlash = normalized.lastIndexOf('/');
        if (lastSlash >= 0) {
            normalized = normalized.substring(lastSlash + 1);
        }

        normalized = UNSAFE_FILE_NAME_CHARS.matcher(normalized).replaceAll("-");
        normalized = normalized.replace("..", "-");

        if (normalized.isBlank()) {
            return "clinical-report.pdf";
        }

        return normalized.length() > 255 ? normalized.substring(0, 255) : normalized;
    }
}
