"use client";

import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpWithEmail } from "@/app/_lib/supabase";
import { useUser } from "@/app/_context/usercontext";
import { useRouter } from "next/dist/client/components/navigation";
import { useState } from "react";

const FormSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        message: "Name must be at least 2 characters.",
      })
      .max(3, {
        message: "Name must be at most 3 characters.",
      }),
    email: z.string().email(),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    acceptTerms: z.boolean().refine((data) => data, {
      message: "You must accept the terms and conditions.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function Page() {
  const { user } = useUser();
  const router = useRouter();
  const [signUpError, setSignUpError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const response = await signUpWithEmail(data.name, data.email, data.password, user.player_id);
    if (response.success) {
      router.push('/');
    } else {
      setSignUpError(response.error || "An error occurred during sign-up.");
    }
  }

  return (
    <div className="min-w-full">
      <h1 className="text-[24px] font-bold font-flick w-full text-center text-[#1F1F1F] opacity-50">
        Sign Up & Save Coins
      </h1>
      <form
        className="px-4 flex flex-col gap-4 mt-6 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          {...register("name")}
          className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
          type="text"
          placeholder="Initials (3)"
        />
        <input
          {...register("email")}
          className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
          type="email"
          placeholder="Email"
        />
        <input
          {...register("password")}
          className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
          type="password"
          placeholder="Password"
        />
        <input
          {...register("confirmPassword")}
          className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
          type="password"
          placeholder="Confirm Password"
        />
        <div className="flex items-center align-top gap-2">
          <input
          {...register("acceptTerms")}
          type="checkbox"
          id="acceptTerms"
          className="min-w-5 min-h-5"
          />
          <label className="text-sm text-cpb-baseblack" htmlFor="acceptTerms">
            By ticking, you confirm that you read, understood, and agree to the{" "}
            <Link className="text-[#5392D3] text-opacity-100 font-bold" href="https://app.termly.io/policy-viewer/policy.html?policyUUID=4fa9ef6d-191f-4e76-aff2-4d63f7d18eb5" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link> and{" "}
            <Link className="text-[#5392D3] text-opacity-100 font-bold" href="https://app.termly.io/policy-viewer/policy.html?policyUUID=6ca156e1-aac1-4fc4-8429-5a484f28e3dd" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
          </label>
        </div>
        <div className="flex flex-col gap-2 text-cpb-lightred text-sm">
          {errors.name?.message && <p>{errors.name?.message}</p>}
          {errors.email?.message && <p>{errors.email?.message}</p>}
          {errors.password?.message && <p>{errors.password?.message}</p>}
          {errors.confirmPassword?.message && (
            <p>{errors.confirmPassword?.message}</p>
          )}
          {errors.acceptTerms?.message && <p>{errors.acceptTerms?.message}</p>}
          {signUpError && <p>{signUpError}</p>}
        </div>
        <button
          className="bg-cpb-baseblack text-cpb-basewhite rounded-xl p-4 uppercase font-bold w-full"
          type="submit"
        >
          Sign Up
        </button>
      </form>
      <p className="text-cpb-baseblack text-sm mt-8 text-opacity-50 text-center w-full">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-cpb-baseblack text-opacity-100">
          Sign In
        </Link>
      </p>
    </div>
  );
}
