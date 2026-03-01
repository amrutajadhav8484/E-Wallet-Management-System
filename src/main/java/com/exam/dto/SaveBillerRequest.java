package com.exam.dto;

import com.exam.entities.BillType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SaveBillerRequest {
    @NotNull(message = "Bill type is required")
    private BillType billType;
    private String consumerInfo;
    private String operatorOrCard;
    private String nickname;
}
