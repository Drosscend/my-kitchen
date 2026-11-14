import { QRCodeSVG } from 'qrcode.react'
import { DialogSheet } from '~/components/dialog_sheet'
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog'

interface ShareSessionDialogProps {
  code: string
  url: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareSessionDialog({ code, url, open, onOpenChange }: ShareSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSheet className="text-center">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">Scanner pour rejoindre</DialogTitle>
          <DialogDescription>
            Scanne le QR code ou saisis le code sur un autre appareil
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={url} size={200} level="M" />
        </div>
        <p className="text-3xl font-bold tracking-[0.3em] tabular-nums">{code}</p>
        <p className="text-xs break-all text-muted-foreground">{url}</p>
      </DialogSheet>
    </Dialog>
  )
}
