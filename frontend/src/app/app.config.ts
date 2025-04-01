import {ApplicationConfig, inject, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {provideApollo} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {InMemoryCache} from '@apollo/client/core';
import {environment} from '../environments/environment';

const uri = environment.API_URL || 'http://localhost:3000/graphql';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(),
        provideApollo(() => {
            const httpLink = inject(HttpLink);
            return {
                link: httpLink.create({ uri, withCredentials: true }),
                cache: new InMemoryCache(),
                credentials: "true"
            };
        }),
    ]
};
