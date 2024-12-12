"use client"

import Link from "next/link";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import { signInWithEmail } from "@/app/_lib/supabase/auth"
import { useRouter } from "next/navigation";
import { useState } from "react";

const FormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function Page() {
  const router = useRouter(); 
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const response = await signInWithEmail(data.email, data.password);
    if (response.success) {
      router.push('/');
    } else {
      setLoginError(response.error || "An error occurred during login.");
    }
  }

  return (
    <div className="min-w-full">
        <h1 className="text-3xl font-bold mt-4 w-full text-center text-cpb-baseblack">Welcome!</h1>
        <p className="text-cpb-baseblack text-sm mt-2 text-opacity-50 w-full text-center">
          Sign in to your account
        </p>
        <form
          className="px-4 flex flex-col gap-4 mt-6 w-full"
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            {...register("email")}
            className="tw-border-solid border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
            type="email"
            placeholder="Email"
          />
          <input
            {...register("password")}
            className="border-2 border-cpb-basegray rounded-xl p-4 w-full placeholder:text-cpb-baseblack text-cpb-baseblack"
            type="password"
            placeholder="Password"
          />
          <div className="flex flex-col gap-2 text-cpb-lightred text-sm">
            {errors.email?.message && <p>{errors.email?.message}</p>} 
            {errors.password?.message && <p>{errors.password?.message}</p>}
            {loginError && <p>{loginError}</p>}
          </div>
          <button
            className="bg-cpb-baseblack text-cpb-basewhite rounded-xl p-4 uppercase font-bold w-full"
            type="submit"
          >
            Sign In
          </button>
        </form>
        <p className="text-cpb-baseblack text-sm mt-8 text-opacity-50 text-center w-full">
          Need to create an account?{" "}
          <Link href="/sign-up" className="text-cpb-baseblack text-opacity-100">
            Sign Up
          </Link>
        </p>
      </div>
  );
}
