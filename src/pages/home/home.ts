import { Component, WrappedValue } from '@angular/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  virgil = new Date(-19, 1, 1); // Aeneid finished in 19 BC
  napoleon = new Date(1804, 12, 2); // Napoleon crowned himself emperor Dec 2, 1804
  cyrus = new Date(1992, 11, 23); // Miley Cyrus Wikipedia page gives her birthday as Nov 23, 1992
  enteredPage = new Date(); // now

  constructor() {}
}
