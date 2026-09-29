import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AiAdvisorPage } from './ai-advisor.page';
import { ApiService } from '../../core/services/api.service';
import { HairstylePreviewService } from './hairstyle-preview.service';

describe('AiAdvisorPage', () => {
  let api: { ai: { recommend: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    api = { ai: { recommend: vi.fn() } };
    await TestBed.configureTestingModule({
      imports: [AiAdvisorPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: ApiService, useValue: api },
        { provide: HairstylePreviewService, useValue: { render: vi.fn().mockResolvedValue('data:image/jpeg;base64,x') } },
      ],
    }).compileComponents();
  });

  function fileOf(name = 'face.jpg', type = 'image/jpeg', size = 1000) {
    return new File([new Uint8Array(size)], name, { type });
  }

  it('creates', () => {
    const f = TestBed.createComponent(AiAdvisorPage);
    expect(f.componentInstance).toBeTruthy();
  });

  it('rejects non-image', () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    const txt = new File(['hi'], 'a.txt', { type: 'text/plain' });
    const ev = { target: { files: [txt], value: '' } } as unknown as Event;
    f.onFilePicked(ev);
    expect(f.errorMsg()).toBeTruthy();
    expect(f.file()).toBeNull();
  });

  it('rejects too large', () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    const big = fileOf('big.jpg', 'image/jpeg', 6 * 1024 * 1024);
    Object.defineProperty(big, 'size', { value: 6 * 1024 * 1024 });
    const ev = { target: { files: [big], value: '' } } as unknown as Event;
    f.onFilePicked(ev);
    expect(f.errorMsg()).toBeTruthy();
  });

  it('analyze success sets result', () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    const fake = { analysis: { faceShape: 'oval', faceShapeConfidence: 0.9, hairCharacteristics: {}, detectedFeatures: [], confidence: 0.9 }, recommendations: [{ id: 'a', title: 'A', titleFa: 'الف', category: 'fade', length: 'short', description: 'd', descriptionFa: 'توضیح', reason: 'r', reasonFa: 'دلیل', stylingTips: [], stylingTipsFa: [], confidence: 0.9, suitableFaceShapes: ['oval'], maintenance: 'low', tags: [] }], matchedServices: [], meta: { provider: 'heuristic', model: 'v1' } };
    api.ai.recommend.mockReturnValue(of(fake as never));
    const img = fileOf();
    f.file.set(img);
    f.analyze();
    expect(f.result()).toEqual(fake);
    expect(f.loading()).toBe(false);
  });

  it('analyze failure sets error', () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    api.ai.recommend.mockReturnValue(throwError(() => ({ status: 500, error: { message: 'boom' } })));
    const img = fileOf();
    f.file.set(img);
    f.analyze();
    expect(f.errorMsg()).toBeTruthy();
    expect(f.loading()).toBe(false);
  });

  it('no file -> error', () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    f.file.set(null);
    f.analyze();
    expect(f.errorMsg()).toBeTruthy();
  });

  it('preview retry rebuilds previews', async () => {
    const f = TestBed.createComponent(AiAdvisorPage).componentInstance;
    const fake = { analysis: { faceShape: 'oval', faceShapeConfidence: 0.9, hairCharacteristics: {}, detectedFeatures: [], confidence: 0.9 }, recommendations: [{ id: 'a', title: 'A', titleFa: 'الف', category: 'fade', length: 'short', description: 'd', descriptionFa: 'توضیح', reason: 'r', reasonFa: 'دلیل', stylingTips: [], stylingTipsFa: [], confidence: 0.9, suitableFaceShapes: ['oval'], maintenance: 'low', tags: [] }], matchedServices: [], meta: { provider: 'heuristic', model: 'v1' } };
    api.ai.recommend.mockReturnValue(of(fake as never));
    f.file.set(fileOf());
    f.analyze();
    await new Promise((r) => setTimeout(r, 0));
    expect(f.result()).toBeTruthy();
  });
});
