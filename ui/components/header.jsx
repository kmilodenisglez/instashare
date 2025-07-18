import Image from 'next/image';
import Link from 'next/link';
import instashareLogo from 'public/instashare-logo.svg';
import githubLogo from 'public/images/github-mark-white.svg';
import AuthButton from './AuthButton';

const navItems = [
    { linkText: 'Home', href: '/' },
];

export function Header() {
    return (
        <nav className="flex flex-wrap items-center gap-4 pt-6 pb-12 sm:pt-12 md:pb-24">
            <Link href="/">
                <Image src={instashareLogo} alt="InstaShare logo" width={200} height={50} />
            </Link>
            {!!navItems?.length && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} className="inline-flex px-1.5 py-1 sm:px-3 sm:py-2">
                                {item.linkText}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
            <Link
                href="https://github.com/kmilodenisglez/instashare"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex lg:ml-auto"
            >
                <Image src={githubLogo} alt="GitHub logo" className="w-7" />
            </Link>
            <AuthButton />
        </nav>
    );
}
