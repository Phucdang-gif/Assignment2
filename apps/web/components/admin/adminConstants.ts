export const ORDER_STATUS_META: Record<
  string,
  { label: string; badgeClass: string }
> = {
  PENDING: {
    label: 'Chờ thanh toán',
    badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  PREPARING: {
    label: 'Đang pha chế',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  READY: {
    label: 'Sẵn sàng giao',
    badgeClass: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  PAYMENT_FAILED: {
    label: 'Lỗi thanh toán',
    badgeClass: 'bg-red-50 text-red-700 border border-red-200',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
  },
};

export const ROLE_META: Record<string, { label: string; badgeClass: string }> = {
  admin: {
    label: 'Admin',
    badgeClass: 'bg-[#3E2723] text-[#FDFBF7]',
  },
  barista: {
    label: 'Barista',
    badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200',
  },
  customer: {
    label: 'Khách hàng',
    badgeClass: 'bg-[#F5F0E6] text-[#5C4D44] border border-[#E8DFD8]',
  },
};

export function formatVnd(value: number | string | undefined): string {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
