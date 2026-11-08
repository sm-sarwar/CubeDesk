"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "@tanstack/react-form";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";

import { useRouter } from "next/navigation";

import * as z from "zod";
import { authClient } from "@/lib/auth-client";
const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8,"Password must be at least 8 characters long"),
})
 

export function SignInForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit : formSchema,
    },
    onSubmit: async ({value}) => {
      try {
        const { data, error } = await authClient.signIn.email(value);
        if (error) return console.log(error) 
       
        router.replace("/");

      } catch (error) {
        console.error(error)
      }
    },
    
  });


  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
              id="email"
              type="email"
              name={field.name}
              autoComplete="email"
              placeholder="you@example.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              />
              {
                isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )
              }
            </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
              id="password"
              type="password"
              name={field.name}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              />
              {
                isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )
              }
            </Field>
            )
          }}
        />
      </FieldGroup>
      <Button className="w-full hover:cursor-pointer bg-[#034E44]" type="submit">
        Submit
      </Button>
    </form>
  );
}
