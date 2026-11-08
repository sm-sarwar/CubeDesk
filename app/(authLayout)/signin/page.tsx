import { SignInForm } from "@/components/auth/sign-in-form"
import { CubeMark } from "@/components/cube-mark"

export default function LoginPage() {

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
  
      <section className="hidden flex-col justify-between bg-[linear-gradient(180deg,#034E44,#04695D)] p-10 text-white lg:flex">
        <div className="flex items-center gap-3">
          <CubeMark className="size-9" />
          <div>
            <span className="text-xl font-bold tracking-tight">CubeDesk</span>
          <p className="text-xs text-[#8FC9C0]">A product of Puzzelbazar</p>
          </div>
        </div>
        

        <div className="max-w-md space-y-3">
          <h2 className="text-3xl font-bold leading-tight">
            Every customer, order and due, in one place.
          </h2>
          <p className="text-[#9FD7CE]">
            Track sales from your website, Daraz and Facebook, and know exactly who still owes you.
          </p>
        </div>

        <div>
          <p className="text-xs text-[#8FC9C0]">© CubeDesk</p>
        <p className="text-xs text-[#8FC9C0]"> Powered by <a href="https://github.com/sm-sarwar" target="_blank" rel="noopener noreferrer" className="hover:no-underline">
            Sarwar
          </a> </p>
        </div>
      </section>

      {/* Right side form */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8  ">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="rounded-lg bg-[#034E44] p-1.5">
              <CubeMark className="size-7" />
            </div>
            <span className="text-lg font-bold">CubeDesk</span>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your customers and orders.
            </p>
          </div>

          <SignInForm />
        </div>
      </section>
    </main>
  )
}