import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevaLecturaPage } from './nueva-lectura.page';

describe('NuevaLecturaPage', () => {
  let component: NuevaLecturaPage;
  let fixture: ComponentFixture<NuevaLecturaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NuevaLecturaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
