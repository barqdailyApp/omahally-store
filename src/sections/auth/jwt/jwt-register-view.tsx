"use client";

import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { yupResolver } from "@hookform/resolvers/yup";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Link, Divider, FormLabel } from "@mui/material";

import { paths } from "@/routes/paths";
import { useRouter } from "@/routes/hooks";
import { RouterLink } from "@/routes/components";

import { register } from "@/actions/auth-methods";

import FormProvider, { RHFTextField } from "@/components/hook-form";

import AuthAgreePolicyField from "./components/agree-policy-field";
import AuthPhoneField, { phoneSchema } from "./components/phone-field";

// ----------------------------------------------------------------------

export default function JwtRegisterView() {
  const t = useTranslations();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const LoginSchema = Yup.object().shape({
    name: Yup.string().required(t("Global.Error.name_required")),
    phoneNumber: phoneSchema(Yup, t),
    agree: Yup.bool().oneOf([true]).required(),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const res = await register({
      phone: `+966${data.phoneNumber.trim()}`,
      name: data.name,
    });
    if ("error" in res) {
      enqueueSnackbar(Array.isArray(res.error) ? res.error[0] : res.error, {
        variant: "error",
      });
      return;
    }
    router.push(paths.auth.jwt.login);
  });

  const renderHead = (
    <Typography variant="h4" mb={2}>
      {t("Pages.Auth.register_title")}
    </Typography>
  );

  return (
    <>
      {renderHead}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2.5}>
          <Box>
            <FormLabel>{t("Global.Label.your_name")}</FormLabel>
            <RHFTextField name="name" placeholder={t("Global.Label.name")} />
          </Box>
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
            {t("Pages.Auth.register_submit")}
          </LoadingButton>

          <Divider flexItem />

          <Typography variant="caption" color="text.secondary">
            {t.rich("Pages.Auth.redirect_to_login", {
              link: (chunks) => (
                <Link
                  href={paths.auth.jwt.login}
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
