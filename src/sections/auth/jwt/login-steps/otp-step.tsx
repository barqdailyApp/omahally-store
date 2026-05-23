"use client";

import * as Yup from "yup";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRef, useState, useEffect, useCallback, ChangeEvent } from "react";

import Stack from "@mui/material/Stack";
import { Box, Link } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { useRouter, useSearchParams } from "@/routes/hooks";

import { useAuthContext } from "@/auth/hooks";
import { PATH_AFTER_LOGIN } from "@/config-global";
import { sendOtp, verifyOtp } from "@/actions/auth-methods";

import { useSnackbar } from "@/components/snackbar";
import FormProvider, { RHFTextField } from "@/components/hook-form";

import { LoginSteps } from "@/types/auth";

type InputNames = "no1" | "no2" | "no3" | "no4";

export default function LoginOTPStep({
  phoneNumber,
  handleStepChange,
}: {
  phoneNumber: string;
  handleStepChange: (stepVal: LoginSteps) => void;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const returnTo = searchParams.get("returnTo");

  const { login } = useAuthContext();

  const [countdown, setCountdown] = useState(60);
  const [resending, setResending] = useState(false);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatCountdown = (seconds: number) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const phoneEnding = phoneNumber.trim().slice(-4);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await sendOtp(`+966${phoneNumber.trim()}`);
      enqueueSnackbar(t("Global.Message.otp_sent"));
      setCountdown(60);
    } catch (err: any) {
      enqueueSnackbar(err, { variant: "error" });
    } finally {
      setResending(false);
    }
  }, [phoneNumber, enqueueSnackbar, t]);

  const anInputSchema = Yup.string().required(" ");

  const LoginSchema = Yup.object().shape({
    no1: anInputSchema,
    no2: anInputSchema,
    no3: anInputSchema,
    no4: anInputSchema,
  });
  const defaultValues = {
    no1: "",
    no2: "",
    no3: "",
    no4: "",
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
    mode: "all",
  });

  const {
    setValue,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const otp = Object.values(data).join("");
    const res = await verifyOtp({
      phoneNumber: `+966${phoneNumber.trim()}`,
      otp,
    });
    if ("error" in res) {
      enqueueSnackbar(res.error, { variant: "error" });
      reset();
      return;
    }

    await login(res);
    router.push(returnTo || PATH_AFTER_LOGIN);
  });

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
  ) => {
    const { name, value } = event.target;

    if (value.length > 1 || Number.isNaN(Number(value))) return;

    setValue(name as InputNames, value);
    if (value) {
      inputsRef.current[index]?.blur();
      inputsRef.current[index + 1]?.focus();
    }
  };

  const renderHead = (
    <Box mb={3}>
      <Typography variant="h4">{t("Pages.Auth.otp_title")}</Typography>
      <Typography color="text.secondary">
        {t("Pages.Auth.otp_subtitle", { phoneEnding })}
      </Typography>
    </Box>
  );
  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          <Stack spacing={2.5} direction="row" style={{ direction: "ltr" }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <RHFTextField
                type="password"
                autoComplete="off"
                autoCorrect="off"
                key={index}
                name={`no${index + 1}`}
                sx={{
                  "& fieldset": {
                    borderRadius: 1,
                  },
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                  },
                  "& input": {
                    fontSize: "40px !important",
                    padding: "0 !important",
                    font: "large sans-serif",
                    "-webkit-text-security": "disc",
                    boxSizing: "border-box",
                  },
                }}
                onChange={(event) => {
                  handleInputChange(event, index);
                }}
                inputProps={{
                  ref: (el: HTMLInputElement) => {
                    inputsRef.current[index] = el;
                  },
                  inputMode: "numeric",
                }}
              />
            ))}
          </Stack>
          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {t("Pages.Auth.otp_submit")}
          </LoadingButton>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            {countdown > 0 ? (
              t("Pages.Auth.otp_resend_countdown", {
                time: formatCountdown(countdown),
              })
            ) : (
              <>
                {t("Pages.Auth.otp_resend_prefix")}{" "}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleResend}
                  sx={{ cursor: resending ? "not-allowed" : "pointer" }}
                >
                  {t("Pages.Auth.otp_resend_link")}
                </Link>
              </>
            )}
          </Typography>

          <Button
            fullWidth
            type="button"
            onClick={() => {
              handleStepChange(LoginSteps.phone);
            }}
            color="primary"
            size="large"
          >
            {t("Pages.Auth.otp_back")}
          </Button>
        </Stack>
      </FormProvider>
    </>
  );
}
