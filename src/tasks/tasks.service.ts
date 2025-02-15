import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskStatus } from './enum/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';
import { GetUser } from '../auth/get-user.decorator';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(TasksRepository) private tasksRepository: TasksRepository) {}

  async getTaskById(id: string, user: User): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id, user } });
    if (!task) {
      // throw new NotFoundException(`Task with ID ${id} not found`);
      throw new UnauthorizedException();
    }
    return task;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, user });
    if (result.affected === 0) {
      // throw new NotFoundException(`Task with ID ${id} not found`);
      throw new UnauthorizedException();
    }
  }

  async updateTaskStatus(id: string, status: TaskStatus, user: User): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await this.tasksRepository.save(task);
    return task;
  }

  getTasks(filterDto: GetTasksFilterDto, @GetUser() user: User): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }
}
