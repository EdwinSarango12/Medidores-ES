import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaLecturasPage } from './lista-lecturas.page';

describe('ListaLecturasPage', () => {
  let component: ListaLecturasPage;
  let fixture: ComponentFixture<ListaLecturasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaLecturasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
