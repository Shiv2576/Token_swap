import {type NextRequest} from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;

    const res = await fetch (
        'https://api.0x.org/swap/permit2/quote?${searchParams}',
        {
            headers : {
                "0x-api-key" : '6fb18b9d-0de0-4c0d-b5b2-880413748f7f',
                "0x-version" : 'v2',
            },

        }
    );

    const data = await res.json();
    console.log(
        "quote api",
        "https://api.0x.org/swap/permit2/quote?${searchParams}"
    )

    return Response.json(data)
}