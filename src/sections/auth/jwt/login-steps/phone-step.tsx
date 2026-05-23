"use client";

import * as Yup from "yup";
import { getCookie } from "cookies-next";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { yupResolver } from "@hookform/resolvers/yup";

import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { Link, Divider } from "@mui/material";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";

import { paths } from "@/routes/paths";
import { RouterLink } from "@/routes/components";

import { COOKIES_KEYS } from "@/config-global";
import { sendOtp } from "@/actions/auth-methods";

import FormProvider from "@/components/hook-form";
import { useSnackbar } from "@/components/snackbar";

import { LoginSteps } from "@/types/auth";

import AuthAgreePolicyField from "../components/agree-policy-field";
import AuthPhoneField, { phoneSchema } from "../components/phone-field";

export default function LoginPhoneStep({
  handleStepChange,
  phoneNumber,
  agree,
  handlePhone,
  handleAgree,
}: {
  handleStepChange: (stepVal: LoginSteps) => void;
  phoneNumber: string;
  agree: boolean;
  handlePhone: (newNumber: string) => void;
  handleAgree: (value: boolean) => void;
}) {
  const t = useTranslations();
  const { enqueueSnackbar } = useSnackbar();

  const LoginSchema = Yup.object().shape({
    phoneNumber: phoneSchema(Yup, t),
    agree: Yup.bool().oneOf([true]).required(),
  });
  const defaultValues = {
    phoneNumber,
    agree,
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await sendOtp(`+966${data.phoneNumber.trim()}`);

      enqueueSnackbar(t("Global.Message.otp_sent"));

      handlePhone(data.phoneNumber);
      handleAgree(data.agree);
      handleStepChange(LoginSteps.otp);
    } catch (err: any) {
      enqueueSnackbar(err, { variant: "error" });
    }
  });

  const renderHead = (
    <Typography variant="h4" mb={2}>
      {t("Pages.Auth.login_title")}
    </Typography>
  );
  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          <AuthPhoneField />
          <AuthAgreePolicyField />

          <LoadingButton
            fullWidth
            color="primary"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            {t("Pages.Auth.login_submit")}
          </LoadingButton>

          {(getCookie(COOKIES_KEYS.expiryTime) || phoneNumber) && (
            <Button
              size="large"
              color="primary"
              type="button"
              onClick={() => {
                handleStepChange(LoginSteps.otp);
              }}
            >
              {t("Pages.Auth.otp_back_reverse")}
            </Button>
          )}

          <Divider flexItem />

          <Typography variant="caption" color="text.secondary">
            {t.rich("Pages.Auth.redirect_to_register", {
              link: (chunks) => (
                <Link
                  href={paths.auth.jwt.register}
                  color="text.primary"
                  fontWeight="bold"
                  component={RouterLink}
                >
                  {chunks}
                </Link>
              ),
            })}
          </Typography>
        </Stack>
      </FormProvider>
    </>
  );
}
