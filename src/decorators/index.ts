import { Controller } from './controller.decorator';
import { Handler } from './controller-handler.decorator';
import { Event } from './controller-handler-param.decorator';
import { Module } from './module.decorator';

export { Module, Controller, Handler, Event };

export const WS = Object.seal({
  Module,
  Controller,
  Handler,
  Event,
});
