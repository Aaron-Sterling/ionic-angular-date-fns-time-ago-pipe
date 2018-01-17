import { OnDestroy, ChangeDetectorRef, Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/delay';
import { repeatWhen, takeWhile, map, tap } from 'rxjs/operators';

import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';
import getTime from 'date-fns/get_time';
import differenceInMinutes from 'date-fns/difference_in_minutes';
import isFuture from 'date-fns/is_future';

// time ago pipe based on date-fns distance function
// because rapropos said on Ionic Forum that i18n dates were less reliable on Apple phones
// also based on timeAgo pipe by Johannes Rudolph posted at: https://gist.github.com/JohannesRudolph/8e6de056d9e33353f940d9da9e6ffd82

@Pipe({name: 'ago', pure: false}) // impure pipe, which in general can lead to bad performance
								  // but the backoff function limits the frequency the pipe checks for updates
								  // so the performance is close to that of a pure pipe
								  // the downside of this is that if you change the value of the input, the pipe might not notice for a while
								  // so this pipe is intended for static data

// expected input is a time (number, string or Date)
// output is a string expressing distance from that time to now, plus the suffix 'ago'
// output refreshes at dynamic intervals, with refresh rate slowing down as the input time gets further away from now
// pipe returns empty string if the input is incorrect type, or is a time in the future

export class TimeAgoPipe implements PipeTransform, OnDestroy {
  
	private readonly async: AsyncPipe;

	private isDestroyed = false;
	private agoExpression: Observable<string>;

	constructor(private cdr: ChangeDetectorRef) {
    	this.async = new AsyncPipe(this.cdr);
	}

	ngOnDestroy() {
		this.isDestroyed = true; // pipe will stop executing after next iteration
	}

	transform(time: number | string | Date): string {
		// error trapping - return empty string if input is a problem
		if (!time) { return '' }
		if (!(typeof time === 'number' || typeof time === 'string' || time instanceof Date)) {
			return '';
		}
		if (isFuture(time)) {
			return ''
		}
		// main transform
		// convert the input to milliseconds, set the pipe to the Observable if not yet done, and return an async pipe
		let milliseconds = getTime(time);
		if (!this.agoExpression) {
			this.agoExpression = this.timeAgo(milliseconds);
		}
		return this.async.transform(this.agoExpression);
	}

	// main text stream
	// inner Observable emits the value TRUE forever
	// each true is mapped to a timeago string, which returns to the template
	// repeat emission of true forever, delayed by newly computed backoff, as long as the destroyed flag is not set
	// once pipe destroyed, Observable completes
	// each time backoff is updated, pipe is marked to be checked by Angular's change detector
	private timeAgo(milliseconds: number): Observable<string> {
		let nextBackoff = this.backoff(milliseconds);
		return Observable.of(true).pipe(
							repeatWhen(emitTrue => emitTrue.delay(nextBackoff)), // will not recheck input until delay completes
		                    takeWhile(_ => !this.isDestroyed),
		                	map(_ => distanceInWordsToNow(milliseconds) + ' ago'),
		                    tap(_ => nextBackoff = this.backoff(milliseconds)));
	}

	// function that calculates how much time to delay before next emission of TRUE
	// input: time (in milliseconds) that is being transformed by the pipe
	// output: number of milliseconds to backoff
	// note: it is impossible for the input to be a time in the future, because of the error trapping in the transform method
	private backoff(milliseconds: number): number {
		let minutesElapsed = differenceInMinutes(new Date(), milliseconds); // this will always be positive
		let backoffAmountInSeconds: number;
		if (minutesElapsed < 2) {
			backoffAmountInSeconds = 5;
		}
		else if (minutesElapsed >= 2 && minutesElapsed < 5) {
			backoffAmountInSeconds = 15;
		}
		else if (minutesElapsed >= 5 && minutesElapsed < 60) {
			backoffAmountInSeconds = 30;
		}
		else if (minutesElapsed >= 60) {
			backoffAmountInSeconds = 300; // 5 minutes
		}
		return backoffAmountInSeconds * 1000; // return an amount of milliseconds
	}
}