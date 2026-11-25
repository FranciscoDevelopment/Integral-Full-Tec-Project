"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ApiError, getErrorMessage } from "@/shared/lib/api-client";
import {
  Button,
  Card,
  ErrorState,
  Input,
  LoadingState,
} from "@/shared/components/ui";
import {
  createContribution,
  getProjectContributions,
  previewContribution,
} from "../api";
import {
  contributionSchema,
  normalizeContributionAmount,
  type ContributionFormValues,
} from "../schema";
import type { ContributionPreview } from "../types";

type PreviewState =
  | {
      amount: string;
      attempt: number;
      status: "ready";
      data: ContributionPreview;
    }
  | { amount: string; attempt: number; status: "error"; message: string };

interface ContributionFormProps {
  projectId: string;
}

export function ContributionForm({ projectId }: ContributionFormProps) {
  const router = useRouter();
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [previewRetry, setPreviewRetry] = useState(0);
  const [projectRetry, setProjectRetry] = useState(0);
  const [projectSummary, setProjectSummary] = useState<
    { totalAmount: string } | { error: string } | null
  >(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(contributionSchema),
    defaultValues: { amount: "" },
  });
  const amountValue = useWatch({ control, name: "amount" }) ?? "";
  const normalizedAmount = normalizeContributionAmount(amountValue);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    getProjectContributions(projectId, 1, 1, controller.signal).then(
      (result) => {
        if (active) setProjectSummary({ totalAmount: result.totalAmount });
      },
      (error: unknown) => {
        if (active) setProjectSummary({ error: getErrorMessage(error) });
      },
    );

    return () => {
      active = false;
      controller.abort();
    };
  }, [projectId, projectRetry]);

  useEffect(() => {
    if (!normalizedAmount) {
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      previewContribution(normalizedAmount, controller.signal).then(
        (data) => {
          if (!controller.signal.aborted) {
            setPreviewState({
              amount: normalizedAmount,
              attempt: previewRetry,
              status: "ready",
              data,
            });
          }
        },
        (error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof DOMException && error.name === "AbortError")
            return;
          setPreviewState({
            amount: normalizedAmount,
            attempt: previewRetry,
            status: "error",
            message: getErrorMessage(error),
          });
        },
      );
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedAmount, previewRetry]);

  async function onSubmit(values: ContributionFormValues) {
    const amount = normalizeContributionAmount(values.amount);
    if (
      !amount ||
      previewState?.status !== "ready" ||
      previewState.amount !== amount
    ) {
      setSubmitError("Esperá a que se calcule el desglose del aporte.");
      return;
    }

    setSubmitError(null);
    try {
      await createContribution(projectId, amount);
      router.push("/me/contributions");
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setSubmitError("Iniciá sesión como sponsor para aportar.");
        return;
      }
      setSubmitError(getErrorMessage(error));
    }
  }

  const currentPreview =
    previewState?.amount === normalizedAmount &&
    previewState.attempt === previewRetry
      ? previewState
      : null;
  const isPreviewLoading = normalizedAmount !== null && currentPreview === null;

  return (
    <Card>
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
      >
        <Input
          {...register("amount")}
          type="text"
          inputMode="decimal"
          label="Monto del aporte"
          placeholder="125,50"
          hint="Podés usar coma o punto; el monto se envía con punto y dos decimales."
          error={errors.amount?.message}
        />

        {projectSummary === null ? (
          <LoadingState label="Cargando el total aportado..." />
        ) : "error" in projectSummary ? (
          <ErrorState
            title="No pudimos cargar el total aportado"
            message={projectSummary.error}
            onRetry={() => {
              setProjectSummary(null);
              setProjectRetry((retry) => retry + 1);
            }}
          />
        ) : (
          <p className="text-sm text-slate-600">
            Total aportado al proyecto: {projectSummary.totalAmount}
          </p>
        )}

        {isPreviewLoading && <LoadingState label="Calculando el desglose..." />}
        {currentPreview?.status === "error" && (
          <ErrorState
            title="No pudimos calcular el desglose"
            message={currentPreview.message}
            onRetry={() => setPreviewRetry((retry) => retry + 1)}
          />
        )}
        {currentPreview?.status === "ready" && (
          <dl className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Aporte</dt>
              <dd className="font-medium text-slate-900">
                {currentPreview.data.amount}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">Cargo de servicio</dt>
              <dd className="font-medium text-slate-900">
                {currentPreview.data.fee}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900">
                {currentPreview.data.total}
              </dd>
            </div>
          </dl>
        )}

        {submitError && (
          <ErrorState
            title="No se pudo confirmar el aporte"
            message={submitError}
          />
        )}

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !normalizedAmount ||
            currentPreview?.status !== "ready"
          }
        >
          {isSubmitting ? "Confirmando..." : "Confirmar aporte"}
        </Button>
      </form>
    </Card>
  );
}
