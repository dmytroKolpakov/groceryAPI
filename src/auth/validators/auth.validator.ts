import { SignInDto } from "../dto/sign-in.dto";
import { HttpException, HttpStatus } from "@nestjs/common";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export const signInValidator = (signInDto: SignInDto): void => {
  if (!signInDto.email || signInDto.email.trim() === '')
    throw new HttpException('Email should not be empty', HttpStatus.BAD_REQUEST);

  if (!signInDto.password || signInDto.password.trim() === '')
    throw new HttpException('Password should not be empty', HttpStatus.BAD_REQUEST);

  if (!signInDto.deviceId || signInDto.deviceId.trim() === '')
    throw new HttpException('Device ID should not be empty', HttpStatus.BAD_REQUEST);
};

export const signUpValidator = (createUserDto: CreateUserDto): void => {
  if (!createUserDto.email || createUserDto.email.trim() === '')
    throw new HttpException('Email should not be empty', HttpStatus.BAD_REQUEST);

  if (!createUserDto.password || createUserDto.password.trim() === '')
    throw new HttpException('Password should not be empty', HttpStatus.BAD_REQUEST);

  if (!createUserDto.userName || createUserDto.userName.trim() === '')
    throw new HttpException('Username should not be empty', HttpStatus.BAD_REQUEST);

  if (!createUserDto.deviceId || createUserDto.deviceId.trim() === '')
    throw new HttpException('Device ID should not be empty', HttpStatus.BAD_REQUEST);
};
