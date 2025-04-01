import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GraphQLError } from 'graphql';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.shouldValidate(metatype)) {
      return value;
    }

    if (value === null || value === undefined) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false
    });

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);

      const errorMessage = 'Validation failed: ' +
        errors.map(err => {
          const constraints = err.constraints ? Object.values(err.constraints).join(', ') : '';
          return `${err.property} - ${constraints}`;
        }).join('; ');

      throw new GraphQLError(errorMessage, {
        extensions: {
          code: 'BAD_USER_INPUT',
          validationErrors: formattedErrors
        }
      });
    }

    return object;
  }

  private shouldValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object, Promise];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.map(error => {
      const constraints = error.constraints
        ? Object.values(error.constraints)
        : ['Unknown error'];

      const children = error.children && error.children.length > 0
        ? this.formatErrors(error.children)
        : [];

      return {
        property: error.property,
        constraints,
        children
      };
    });
  }
}