import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';

import { Booking } from './booking.model';
import { AuthService } from '../auth/auth.service';
import {environment} from '../../environments/environment';

interface BookingData {
  id: string;
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private _bookings = new BehaviorSubject<Booking[]>([]);

  get bookings() {
    return this._bookings.asObservable();
  }

  constructor(private authService: AuthService, private http: HttpClient) {}

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    let generatedId: string;
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
    return this.http
      .post<{ name: string }>(
        environment.jsonServerUrl + '/bookings',
        { ...newBooking}
      )
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.http
      .delete(
        environment.jsonServerUrl + `/bookings/${bookingId}`
      )
      .pipe(
        switchMap(() => this.bookings),
        take(1),
        tap(bookings => {
          console.log('deleted booking', bookingId);
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
      );
  }

  fetchBookings() {
    return this.http
      .get<{ [key: string]: BookingData }>(
        environment.jsonServerUrl + '/bookings'
      )
      .pipe(
        map(bookingData => {
          const bookings = [];
          for (const index in bookingData) {
            if (bookingData.hasOwnProperty(index)) {
              bookings.push(
                new Booking(
                  bookingData[index].id,
                  bookingData[index].placeId,
                  bookingData[index].userId,
                  bookingData[index].placeTitle,
                  bookingData[index].placeImage,
                  bookingData[index].firstName,
                  bookingData[index].lastName,
                  bookingData[index].guestNumber,
                  new Date(bookingData[index].bookedFrom),
                  new Date(bookingData[index].bookedTo)
                )
              );
            }
          }
          return bookings;
        }),
        tap(bookings => {
          this._bookings.next(bookings);
        })
      );
  }
}
