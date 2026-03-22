import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MenuService } from "./menu.service";
import { MENU_QUEUE, MenuJobData } from "../queue/constants";

@Processor(MENU_QUEUE)
export class MenuProcessor extends WorkerHost {
  private readonly logger = new Logger(MenuProcessor.name);

  constructor(private readonly menuService: MenuService) {
    super();
  }

  async process(job: Job<MenuJobData>): Promise<void> {
    this.logger.log(`Обработка задачи ${job.id}: menuId=${job.data.menuId}`);

    try {
      await this.menuService.processMenuJob(job.data);
      this.logger.log(`Задача ${job.id} завершена успешно`);
    } catch (err) {
      this.logger.error(`Задача ${job.id} упала: ${String(err)}`);
      // Пробрасываем ошибку чтобы BullMQ пометил job как failed
      throw err;
    }
  }
}
