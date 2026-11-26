import { Button } from "./Button";
import Dialog from "./Dialog";
import Icon from "./Icon";

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Odustani",
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Dialog open={open} onClose={busy ? () => {} : onCancel} title={title} size="sm" role="alertdialog">
      {message && (
        <p className="font-montserrat text-sm leading-relaxed text-white/70">{message}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy && <Icon name="spinner" className="size-4" />}
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
