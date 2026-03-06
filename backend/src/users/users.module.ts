import { Global, Module } from '@nestjs/common';
import { UsersStore } from './users-store.service';

@Global()
@Module({
  providers: [UsersStore],
  exports: [UsersStore],
})
export class UsersModule {}
