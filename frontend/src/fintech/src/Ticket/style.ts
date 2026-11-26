const styles = {
  container:
    'flex min-h-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_-24px_rgba(15,23,42,0.35)]',
  header:
    'border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_50%,#f8fafc_100%)] px-4 py-4 lg:px-6',
  modeBadge:
    'rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-600',
  layout: 'flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row',
  sidebar:
    'shrink-0 border-b border-slate-200 bg-slate-50/70 lg:flex lg:w-[320px] lg:border-b-0 lg:border-r',
  sidebarPanel: 'flex min-h-0 flex-1 flex-col',
  sidebarHeader: 'border-b border-slate-200 px-4 py-4',
  sidebarCard: 'mt-2 rounded-2xl border border-slate-200 bg-white/90 px-3 py-3',
  content: 'min-h-0 flex-1 overflow-auto bg-white',
  formBody:
    'mx-auto flex min-h-full max-w-[1440px] flex-col gap-4 px-4 py-4 lg:px-6 lg:py-6',
  nodeList: 'max-h-[40vh] overflow-auto px-4 py-4 lg:max-h-none lg:flex-1',
  nodeEmpty:
    'rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-6 text-sm text-slate-500',
};

export default styles;
