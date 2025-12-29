import { SetMetadata } from '@nestjs/common';
import { AuthTypeEnum } from '../enums/auth-type.enum';
import { AUTH_TYPE_KEY } from '../constants';

export const Auth = (...authTypes: AuthTypeEnum[]) => SetMetadata(AUTH_TYPE_KEY, authTypes);

