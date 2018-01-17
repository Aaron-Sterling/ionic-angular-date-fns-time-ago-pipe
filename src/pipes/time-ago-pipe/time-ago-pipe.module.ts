import { NgModule } from '@angular/core';
import { TimeAgoPipe } from './time-ago-pipe';

// time ago pipe module

@NgModule({
    declarations: [
    	TimeAgoPipe
    ],
    imports: [],
    exports: [
        TimeAgoPipe
    ]
})
export class TimeAgoPipeModule {}
