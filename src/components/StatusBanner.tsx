import styles from "@/components/workbench.module.css";

interface StatusBannerProps {
  variant: "error" | "info";
  title: string;
  message: string;
}

export function StatusBanner({ variant, title, message }: StatusBannerProps) {
  const className =
    variant === "error"
      ? `${styles.banner} ${styles.bannerError}`
      : `${styles.banner} ${styles.bannerInfo}`;

  return (
    <div className={className} role={variant === "error" ? "alert" : "status"}>
      <div>
        <p className={styles.bannerTitle}>{title}</p>
        <p>{message}</p>
      </div>
    </div>
  );
}
