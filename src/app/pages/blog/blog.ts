import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { BlogCard } from '../../shared/components/blogCard/blogCard';
import { BlogPost } from './models/BlogPost';

@Component({
  selector: 'app-blog',
  imports: [BlogCard],
  templateUrl: './blog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Blog {
  blogPosts = signal<BlogPost[]>([
    {
      id: 1,
      title: 'The Future of Web Development',
      excerpt: 'Exploring the latest trends and technologies shaping the future of web development in 2025 and beyond.',
      image: 'https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp',
      author: 'John Smith',
      date: new Date('2024-11-01'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`
    },
    {
      id: 2,
      title: 'Mastering TypeScript in Modern Applications',
      excerpt: 'A comprehensive guide to leveraging TypeScript for building robust and maintainable applications.',
      image: 'https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp',
      author: 'Sarah Johnson',
      date: new Date('2024-10-28'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet.

Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Curabitur sodales ligula in libero. Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor.`
    },
    {
      id: 3,
      title: 'Building Scalable Microservices Architecture',
      excerpt: 'Learn how to design and implement microservices that scale with your business needs.',
      image: 'https://img.daisyui.com/images/stock/photo-1559703248-dcaaec9fab78.webp',
      author: 'Michael Chen',
      date: new Date('2024-10-25'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas mauris lectus, lobortis et purus mattis, blandit dictum tellus. Maecenas non lorem quis tellus placerat varius.

Nulla facilisi. Integer aliquet mauris et nibh interdum accumsan. Curabitur accumsan orci sed justo vulputate, vitae vestibulum metus varius. Etiam volutpat, leo vitae tincidunt egestas, nunc mi suscipit velit, vel accumsan ante sapien ut odio.

Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Duis mollis, est non commodo luctus, nisi erat porttitor ligula.`
    },
    {
      id: 4,
      title: 'UI/UX Design Principles for 2025',
      excerpt: 'Discover the essential design principles that will define user experiences in the coming year.',
      image: 'https://img.daisyui.com/images/stock/photo-1565098772267-60af42b81ef2.webp',
      author: 'Emily Rodriguez',
      date: new Date('2024-10-20'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.

Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.`
    },
    {
      id: 5,
      title: 'Cloud Computing Best Practices',
      excerpt: 'Essential strategies for leveraging cloud infrastructure to optimize performance and reduce costs.',
      image: 'https://img.daisyui.com/images/stock/photo-1572635148818-ef6fd45eb394.webp',
      author: 'David Park',
      date: new Date('2024-10-15'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Donec sed odio dui.

Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes.`
    },
    {
      id: 6,
      title: 'Cybersecurity in the Modern Age',
      excerpt: 'Protecting your applications and data from emerging threats in an increasingly connected world.',
      image: 'https://img.daisyui.com/images/stock/photo-1494232410401-ad00d5433cfa.webp',
      author: 'Lisa Thompson',
      date: new Date('2024-10-10'),
      content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis. Etiam porta sem malesuada magna mollis euismod.

Nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit. Donec id elit non mi porta gravida at eget metus.

Maecenas sed diam eget risus varius blandit sit amet non magna. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.`
    }
  ]);
}
