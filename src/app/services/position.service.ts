import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {baseURL} from '../shared/baseUrl';
import {HttpClient} from '@angular/common/http';
import {Position} from '../shared/position';

@Injectable()
export class PositionService {

  constructor(private http: HttpClient) {
  }
  getPositions(): Observable<any> {
    return this.http.get(baseURL + 'positions')
      .map(res => {
        return res;
      });
  }
  getPosition(id: number): Observable<Position> {
    return this.http.get<Position>(baseURL + 'positions/' + id)
      .map(res => {
        return res;
      });
  }
  getFeaturedPosition(): Observable<Position> {
    return this.http.get<Position>(baseURL + '/positions?featured=true')
      .map(res => {
        return res[0];
      });
  }
  getPositionIds(): Observable<number[]> {
    return this.getPositions().map(positions => {
      return positions.map(position => position.id);
    });
  }
}
