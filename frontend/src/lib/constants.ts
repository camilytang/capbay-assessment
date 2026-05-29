export const STATUS_LABELS: Record<string, string> = {
    REGISTERED: "Registered",
    TEST_DRIVE_SCHEDULED: "Test Drive Scheduled",
    TEST_DRIVE_COMPLETED: "Test Drive Completed",
    PURCHASED: "Purchased",
    CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
    REGISTERED: "#007bff",
    TEST_DRIVE_SCHEDULED: "#fd7e14",
    TEST_DRIVE_COMPLETED: "#6f42c1",
    PURCHASED: "#28a745",
    CANCELLED: "#dc3545",
};

export const formatMoney = (amount: string | number): string => {
    return Number(amount).toLocaleString('en-MY', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};