import { TestBed } from '@angular/core/testing';

import { ConectionHandlerService } from './conection-handler.service';

describe('ConectionHandlerService', () => {
  let service: ConectionHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConectionHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
