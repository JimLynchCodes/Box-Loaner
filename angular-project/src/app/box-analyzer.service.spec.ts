import { TestBed } from '@angular/core/testing';

import { BoxAnalyzerService } from './box-analyzer.service';

describe('BoxAnalyzerService', () => {
  let service: BoxAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoxAnalyzerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
