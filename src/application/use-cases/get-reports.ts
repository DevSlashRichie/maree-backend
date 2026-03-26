import type { Reports } from "@/application/dtos/report";
import { ReportRepo } from "@/domain/repositories/report-repo";
import { DB } from "@/infrastructure/db/postgres";

export async function getReportsUseCase(): Promise<Reports> {
  const reports = await DB.transaction(async (txn) => {
    const reportRepo = new ReportRepo(txn);

    const [weeklyOrders, topProducts, categoryConsumption] = await Promise.all([
      reportRepo.getWeeklyOrders(),
      reportRepo.getTopProducts(5),
      reportRepo.getCategoryConsumption(),
    ]);

    return {
      weeklyOrders,
      topProducts,
      categoryConsumption,
    };
  });

  return reports;
}
