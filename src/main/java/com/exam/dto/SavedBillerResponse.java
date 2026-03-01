package com.exam.dto;

import com.exam.entities.BillType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SavedBillerResponse {
    private Integer savedBillerId;
    private BillType billType;
    private String consumerInfo;
    private String operatorOrCard;
    private String nickname;
    private LocalDateTime createdAt;
}
