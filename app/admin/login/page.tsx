"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default function Page() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const isUsernameValid = data.username === process.env.NEXT_PUBLIC_SUPER_U;
    const isPasswordValid = data.password === process.env.NEXT_PUBLIC_SUPER_P;

    if (isUsernameValid && isPasswordValid) {
      document.cookie = "admin-auth=true; path=/; max-age=21600";
      router.push("/admin/dashboard");
    } else {
      setAuthError("Invalid credentials");
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32 min-h-full justify-center items-center">
      <div className="min-w-full">
        <h1 className="text-3xl font-bold mt-4 w-full text-center text-cpb-baseblack">
          Welcome Game Admin!
        </h1>
        <p className="text-cpb-baseblack text-sm mt-2 text-opacity-50 w-full text-center">
          Everything on the backend is protected by a super secret password.
        </p>
        <form
          className="flex flex-col gap-4 mt-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            {...register("username")}
            className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
            type="text"
            placeholder="Username"
          />
          <input
            {...register("password")}
            className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
            type="password"
            placeholder="Password"
          />
          <div className="flex flex-col gap-2 text-cpb-lightred text-sm">
            {errors.username?.message && <p>{errors.username?.message}</p>}
            {errors.password?.message && <p>{errors.password?.message}</p>}
            {authError && <p>{authError}</p>}
          </div>
          <button
            className="bg-cpb-baseblack text-cpb-basewhite rounded-xl p-4 uppercase font-bold w-full"
            type="submit"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}