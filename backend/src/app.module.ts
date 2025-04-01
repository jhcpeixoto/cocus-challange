import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@/modules/users/users.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TransactionsModule } from '@/modules/transactions/transactions.module';
import { ConfigModule } from '@nestjs/config';
import configuration from '@/config/configuration';
import { Ctx } from '@/common/types/context.interface';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async () => ({
        uri: process.env.MONGO_URI,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
      context: ({ req, res }: Ctx) => ({ req, res }),
      sortSchema: true,
      introspection: true,
    }),
    UsersModule,
    AuthModule,
    TransactionsModule,
  ],
  providers: [],
})
export class AppModule {}