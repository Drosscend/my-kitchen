import { Form } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { CookingPotIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'

export default function JoinCookingSession() {
  const [code, setCode] = useState('')

  return (
    <>
      <Head title="Rejoindre une session" />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
        <div className="flex items-center gap-2">
          <CookingPotIcon className="size-8" />
          <h1 className="kraft-title text-2xl font-bold">Rejoindre une session</h1>
        </div>

        <Form route="cooking.join.store" className="flex flex-col items-center gap-4">
          {({ processing }) => (
            <>
              <Input
                type="text"
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                aria-label="Code de la session"
                className="h-auto w-48 rounded-lg p-3 text-center font-mono text-3xl font-bold tracking-[0.3em] md:text-3xl"
              />
              <Button type="submit" size="lg" disabled={code.length !== 6 || processing}>
                Rejoindre
              </Button>
            </>
          )}
        </Form>
      </main>
    </>
  )
}
