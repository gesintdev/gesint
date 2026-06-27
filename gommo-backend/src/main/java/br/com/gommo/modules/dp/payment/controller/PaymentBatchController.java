package br.com.gommo.modules.dp.payment.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import br.com.gommo.modules.dp.payment.dto.PaymentBatchProcessResponseDto;
import br.com.gommo.modules.dp.payment.dto.PaymentBatchResponseDto;
import br.com.gommo.modules.dp.payment.dto.PaymentSlipResponseDto;
import br.com.gommo.modules.dp.payment.dto.PaymentSlipSendResponseDto;
import br.com.gommo.modules.dp.payment.entity.PaymentSlipStatusEnum;
import br.com.gommo.modules.dp.payment.service.IPaymentBatchService;

@RestController
@RequestMapping("/api/v1/payment-batches")
public class PaymentBatchController {

    private final IPaymentBatchService batchService;

    public PaymentBatchController(IPaymentBatchService batchService) {
        this.batchService = batchService;
    }

    @GetMapping("/by-period/{periodId}")
    public ResponseEntity<List<PaymentBatchResponseDto>> findByPeriod(@PathVariable UUID periodId) {
        return ResponseEntity.ok(batchService.findByPeriod(periodId));
    }

    @PostMapping(value = "/upload/{periodId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaymentBatchProcessResponseDto> upload(
            @PathVariable UUID periodId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(batchService.uploadAndProcess(periodId, file, description));
    }

    @DeleteMapping("/{batchId}")
    public ResponseEntity<Void> delete(@PathVariable UUID batchId) {
        batchService.delete(batchId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{batchId}/slips")
    public ResponseEntity<List<PaymentSlipResponseDto>> findSlips(
            @PathVariable UUID batchId, @RequestParam(required = false) PaymentSlipStatusEnum status) {
        return ResponseEntity.ok(batchService.findSlips(batchId, status));
    }

    @PostMapping("/{batchId}/send-all")
    public ResponseEntity<Map<String, Integer>> sendAll(@PathVariable UUID batchId) {
        int sent = batchService.sendAllProcessed(batchId);
        return ResponseEntity.ok(Map.of("sentCount", sent));
    }

    @PostMapping("/slips/{slipId}/send-email")
    public ResponseEntity<PaymentSlipSendResponseDto> sendEmail(@PathVariable UUID slipId) {
        return ResponseEntity.ok(batchService.sendEmail(slipId));
    }

    @PostMapping("/slips/{slipId}/send-whatsapp")
    public ResponseEntity<PaymentSlipSendResponseDto> sendWhatsapp(@PathVariable UUID slipId) {
        return ResponseEntity.ok(batchService.sendWhatsapp(slipId));
    }

    @PostMapping("/slips/{slipId}/validate")
    public ResponseEntity<PaymentSlipResponseDto> validateSlip(@PathVariable UUID slipId) {
        return ResponseEntity.ok(batchService.validateSlip(slipId));
    }
}
