import { TestBed } from '@angular/core/testing';

import { GameballWidget } from './gameball-widget';

describe('GameballWidget', () => {
  let service: GameballWidget;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameballWidget);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
