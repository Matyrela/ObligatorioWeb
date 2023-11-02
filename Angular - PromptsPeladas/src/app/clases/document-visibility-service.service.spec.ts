import { TestBed } from '@angular/core/testing';

import { DocumentVisibilityServiceService } from './document-visibility-service.service';

describe('DocumentVisibilityServiceService', () => {
  let service: DocumentVisibilityServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentVisibilityServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
